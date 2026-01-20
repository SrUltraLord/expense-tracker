export type TelegramPhotoSize = {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  width: number;
  height: number;
};

export type TelegramFile = {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
};

export type TelegramMessageRequest = {
  message: TelegramMessage;
};

export type TelegramMessage = {
  message_id: number;
  chat: {
    id: number;
  };
  text?: string;
  photo?: TelegramPhotoSize[];
  caption?: string;
};
