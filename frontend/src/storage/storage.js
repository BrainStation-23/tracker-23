export const setLocalStorage = (key, data) => {
  if (!data) {
    console.log("Data empty");
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.log("Failed to save in local storage");
  }
};

export const getLocalStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? null);
  } catch (e) {
    // logout();
  }
};

export const deleteFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    // logout();
  }
};
