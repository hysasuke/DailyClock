export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    const context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(context, args), delay);
  };
}

export function swapItems(array, index1, index2) {
  const newArray = [...array];
  const temp = newArray[index1];
  newArray[index1] = newArray[index2];
  newArray[index2] = temp;
  return newArray;
}

export function swapOrders(orders, fromID, toID) {
  const fromOrder = orders[fromID];
  const toOrder = orders[toID];
  const newOrders = { ...orders };
  newOrders[fromID] = toOrder;
  newOrders[toID] = fromOrder;
  return newOrders;
}

export default { debounce };
