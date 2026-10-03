// A missing acknowledgement is ambiguous: the server may already have saved the
// message. The caller must reuse the same clientId for REST and manual retries.
export async function deliverDirectMessage<T>(options: {
  socketSend?: (ack: (response: { error?: string; message?: T }) => void) => void;
  restSend: () => Promise<T>;
  timeoutMs?: number;
}): Promise<T> {
  if (!options.socketSend) return options.restSend();

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await new Promise<T>((resolve, reject) => {
      timer = setTimeout(
        () => reject(new Error("Message acknowledgement timed out.")),
        options.timeoutMs ?? 8000,
      );
      options.socketSend!((response) => {
        if (response?.error) reject(new Error(response.error));
        else if (response?.message) resolve(response.message);
        else reject(new Error("Invalid message acknowledgement."));
      });
    });
  } catch {
    return await options.restSend();
  } finally {
    clearTimeout(timer);
  }
}
