export const convertCurrency = (amount, from, to) => {
  const fromValueInUSD = from.value_in_usd;
  const toValueUSD = to.value_in_usd;
  return ((amount / toValueUSD) * fromValueInUSD).toFixed(2);
};
