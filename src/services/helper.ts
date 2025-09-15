// import dayjs from "dayjs";

// export const FORMATE_DATE = "YYYY-MM-DD";

// export const dateRangeValidate = (dateRange: any) => {
//   if (!dateRange) return undefined;

//   const startDate = dayjs(dateRange[0], FORMATE_DATE).toDate();
//   const endDate = dayjs(dateRange[1], FORMATE_DATE).toDate();

//   return [startDate, endDate];
// };

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const FORMATE_DATE = "YYYY-MM-DD";

export const dateRangeValidate = (dateRange: any) => {
  if (!dateRange || !dateRange[0] || !dateRange[1]) return undefined;

  const startDate =
    dayjs(dateRange[0]).utc().format("YYYY-MM-DDTHH:mm:ss.SSS000") + "Z";
  const endDate =
    dayjs(dateRange[1]).utc().format("YYYY-MM-DDTHH:mm:ss.SSS000") + "Z";

  return [startDate, endDate];
};
