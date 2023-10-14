const isNumeric = (value: number | string): boolean => {
  // Convert to string if it's a number
  const strValue = typeof value === "number" ? value.toString() : value;

  // Use a regular expression to check if the string is a valid positive integer
  const positiveIntegerRegex = /^\d+$/;

  // Check if the string matches the pattern and if the number is greater than or equal to 0
  return positiveIntegerRegex.test(strValue) && parseInt(strValue, 10) >= 0;
};

export default isNumeric;
