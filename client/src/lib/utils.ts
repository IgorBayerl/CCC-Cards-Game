export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}


// Helper function to toggle an element in an array
export const toggleInArray = <T,>(arr: T[], value: T): T[] => {
  return arr.includes(value) ? arr.filter((item) => item !== value) : [...arr, value];
};