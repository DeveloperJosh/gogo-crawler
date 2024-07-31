import colors from 'colors';

const colorMapping = {
  info: 'cyan',
  error: 'red',
  success: 'green',
};

export const logInfo = (message) => {
  console.info(colors[colorMapping.info](message));
};

export const logError = (message) => {
  console.error(colors[colorMapping.error](message));
};

export const logSuccess = (message) => {
  console.info(colors[colorMapping.success](message));
};
