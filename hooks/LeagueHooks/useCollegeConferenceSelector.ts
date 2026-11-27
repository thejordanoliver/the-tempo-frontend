import { useCallback, useMemo, useRef, useState } from "react";
import type { ConferenceListModalRef } from "components/League/ConferenceListModal";
import {
  resolveCollegeConference,
  type CollegeConferenceLeague,
} from "constants/conferences/collegeConferences";

export function useCollegeConferenceSelector(
  league: CollegeConferenceLeague,
  showInHeader: boolean,
) {
  const conferenceModalRef = useRef<ConferenceListModalRef>(null);
  const [conferenceGroupId, setConferenceGroupId] = useState<number | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  const onOpenLeagueModal = useCallback(() => {
    conferenceModalRef.current?.present();
  }, []);

  const conferenceHeaderProps = useMemo(
    () =>
      showInHeader
        ? {
            onOpenLeagueModal,
            modalVisible,
            selectedConferenceName:
              conferenceGroupId === null
                ? undefined
                : resolveCollegeConference(league, conferenceGroupId)
                    ?.shortName,
          }
        : undefined,
    [conferenceGroupId, league, modalVisible, onOpenLeagueModal, showInHeader],
  );

  return {
    conferenceGroupId,
    conferenceHeaderProps,
    conferenceModalProps: {
      ref: conferenceModalRef,
      league,
      selectedConference: conferenceGroupId ?? "top25",
      onSelect: (selection: number | string | null) =>
        setConferenceGroupId(typeof selection === "number" ? selection : null),
      onOpen: () => setModalVisible(true),
      onClose: () => setModalVisible(false),
    },
  };
}
