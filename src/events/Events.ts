import { createEvent } from "react-event-hook";
import { UserInformationResponse } from "../gateway/models/UserInformationResponse";

export const { useUserInformationChangedListener, emitUserInformationChanged } = createEvent('user-information-changed')<UserInformationResponse>()
