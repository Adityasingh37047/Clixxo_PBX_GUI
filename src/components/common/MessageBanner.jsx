import { Alert } from "@mui/material";

const extensionFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const MessageBanner = ({ message, onClose }) =>
  message && message.text ? (
    <Alert severity={message.type} onClose={onClose} sx={extensionFixedAlertSx}>
      {message.text}
    </Alert>
  ) : null;

export { MessageBanner, extensionFixedAlertSx };
