export function findInsertIndex(arr: readonly number[], elem: number) {
  const length = arr.length;
  let start = 0;
  let end = length - 1;

  while (start <= end) {
    const mid = Number.parseInt(((start + end) / 2).toString());

    if (arr[mid] === elem) {
      return mid;
    } else if (arr[mid] < elem) {
      start = mid + 1;
    } else {
      end = mid - 1;
    }
  }

  return end + 1;
}

export function meterInArray(arr: readonly number[], meter: number) {
  const length = arr.length;
  let start = 0;
  let end = length - 1;

  while (start <= end) {
    const mid = Number.parseInt(((start + end) / 2).toString());
    const meterAtMid = arr[mid];

    if (meter === meterAtMid) {
      return true;
    } else if (meter < meterAtMid) {
      end = mid - 1;
    } else if (meter > meterAtMid) {
      start = mid + 1;
    }
  }

  return false;
}
