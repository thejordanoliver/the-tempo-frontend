import { useMessagesContext } from "contexts/MessagesContext";
import * as SMS from "expo-sms";
import { Share } from "react-native";
import { useDebounce } from "hooks/useDebounce";
import { useEffect, useRef, useState } from "react";
import { searchUsers, type UserSearchResult } from "services/usersApi";
import { getDefaultMessagingApp, type DefaultMessagingApp } from "services/defaultMessagingApp";
import { getForumShareRecipients } from "utils/forumShareRecipients";
import type { ForumPost } from "types/forum";
import { getErrorMessage } from "utils/getErrorMessage";
import { getForumPostShareText } from "utils/forumPostShare";

export function useForumPostShare(post: ForumPost, currentUserId: number | null, onShared: () => Promise<void>) {
  const { createOrGetConversation, sendDirectMessage, getConversationList, loadConversations } = useMessagesContext();
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<{ query: string; users: UserSearchResult[]; error: string | null } | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [messagingApp, setMessagingApp] = useState<DefaultMessagingApp | null>(null);
  const [active, setActive] = useState(false);
  const [confirmRecipient, setConfirmRecipient] = useState<UserSearchResult | null>(null);
  const recipientRef = useRef<UserSearchResult | null>(null);
  const busy = useRef(false);
  const mounted = useRef(true);
  const attempts = useRef(new Map<string, string>());
  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const recentState = getConversationList();
  const recentUsers = active ? getForumShareRecipients(recentState.items, currentUserId) : [];

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    if (currentUserId != null) void loadConversations({ background: true }).catch(() => {});
    void getDefaultMessagingApp().then((app) => {
      if (!cancelled) setMessagingApp(app);
    });
    return () => { cancelled = true; };
  }, [active, currentUserId, loadConversations]);

  const normalizedQuery = query.trim();
  const currentResult = active && searchResult?.query === normalizedQuery ? searchResult : null;
  const users = currentResult?.users.filter((user) => String(user.id) !== String(currentUserId)) ?? [];
  const searchError = currentResult?.error ?? null;
  const loading = active && normalizedQuery.length >= 2 && !currentResult;

  useEffect(() => {
    // Results are keyed to the live query so old rows disappear during debounce.
    if (!active || normalizedQuery.length < 2 || normalizedQuery !== debouncedQuery.trim()) return;
    let cancelled = false;
    searchUsers(normalizedQuery).then((results) => {
      if (!cancelled) setSearchResult({ query: normalizedQuery, users: results, error: null });
    }).catch((err: unknown) => {
      if (!cancelled) setSearchResult({ query: normalizedQuery, users: [], error: getErrorMessage(err, "Could not search users.") });
    });
    return () => { cancelled = true; };
  }, [active, normalizedQuery, debouncedQuery]);

  const open = () => {
    setQuery(""); setSearchResult(null); setError(null); setSentTo(null);
    recipientRef.current = null; setConfirmRecipient(null);
    setActive(true);
  };

  const send = async (user: UserSearchResult) => {
    if (busy.current) return;
    if (currentUserId == null) { setError("Sign in to send a post in Tempo."); return; }
    busy.current = true; setPending(true); setError(null); setSentTo(null);
    const recipient = String(user.id);
    // Reuse the identifier after an ambiguous delivery failure to prevent duplicates.
    const clientId = attempts.current.get(recipient) ?? `post-share-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    attempts.current.set(recipient, clientId);
    try {
      const { conversationId } = await createOrGetConversation(user.id);
      const sent = await sendDirectMessage(conversationId, { text: getForumPostShareText(post), clientId });
      if (!sent) throw new Error("Post could not be sent. Try again.");
      if (mounted.current) setSentTo(user.username);
      if (currentUserId != null && String(currentUserId) !== String(post.user_id)) await onShared();
      return conversationId;
    } catch (err: unknown) {
      if (mounted.current) setError(getErrorMessage(err, "Could not send post."));
    } finally {
      busy.current = false;
      if (mounted.current) setPending(false);
    }
  };

  const sendSms = async () => {
    if (busy.current) return;
    busy.current = true; setPending(true); setError(null); setSentTo(null);
    try {
      if (!(await SMS.isAvailableAsync())) throw new Error("Text messages are unavailable on this device. Try sending a Tempo DM.");
      const { result } = await SMS.sendSMSAsync([], getForumPostShareText(post));
      // Android reports unknown. Never claim delivery or count a cancelled composer.
      if (result === "sent" && currentUserId != null && String(currentUserId) !== String(post.user_id)) await onShared();
      return result !== "cancelled";
    } catch (err: unknown) {
      if (mounted.current) setError(getErrorMessage(err, "Could not open text messages."));
      return false;
    } finally {
      busy.current = false;
      if (mounted.current) setPending(false);
    }
  };

  const sendExternal = async () => {
    if (busy.current) return false;
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      const result = await Share.share({ message: getForumPostShareText(post) });
      // The system sheet doesn't confirm delivery; don't record a share here.
      return result.action === Share.sharedAction;
    } catch (err: unknown) {
      if (mounted.current) setError(getErrorMessage(err, "Could not open sharing apps."));
      return false;
    } finally {
      busy.current = false;
      if (mounted.current) setPending(false);
    }
  };

  const requestSend = (user: UserSearchResult) => {
    if (busy.current) return;
    recipientRef.current = user;
    setConfirmRecipient(user);
  };

  const cancelSend = () => {
    if (busy.current) return;
    recipientRef.current = null;
    setConfirmRecipient(null);
  };

  const confirmSend = async () => {
    const user = recipientRef.current;
    if (!user || busy.current) return;
    recipientRef.current = null;
    setConfirmRecipient(null);
    return send(user);
  };

  const close = () => {
    cancelSend();
    setActive(false);
  };

  return { confirmRecipient, requestSend, cancelSend, confirmSend, recentUsers, recentLoading: recentState.isLoading || (!recentState.loaded && active && currentUserId != null && !recentState.error), recentError: recentState.error, messagingApp, query, setQuery, users, loading, pending, error, searchError, sentTo, open, close, sendSms, sendExternal };
}
