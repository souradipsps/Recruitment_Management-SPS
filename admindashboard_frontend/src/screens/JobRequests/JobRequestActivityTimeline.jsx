import { T } from "../../theme";
import ActivityChatHistory from "../../components/ActivityChatHistory";

export default function JobRequestActivityTimeline({ history, currentUser, justification, requestedBy }) {
  return (
    <ActivityChatHistory
      history={history}
      currentUser={currentUser}
      justification={justification}
      requestedBy={requestedBy}
    />
  );
}
