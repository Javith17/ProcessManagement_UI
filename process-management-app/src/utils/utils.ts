import dayjs from "dayjs";

const formatDate = (date: string) => {
  return dayjs(date).format("YYYY-MM-DD");
};

const formatTime = (epoch: string | number) => {
  if (!epoch) return "-";

  return dayjs(Number(epoch)).format("HH:mm");
};

const parseLocationDetails = (locationDetails: string) => {
  try {
    return JSON.parse(locationDetails || "{}");
  } catch {
    return {};
  }
};

const parseBreakDetails = (breakDetails: string) => {
  try {
    return JSON.parse(breakDetails || "[]");
  } catch {
    return [];
  }
};