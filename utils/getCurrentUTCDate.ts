function getCurrentUTCDate(): Date {
  const utcDateString = new Date().toUTCString();
  return new Date(utcDateString);
}

export default getCurrentUTCDate;
