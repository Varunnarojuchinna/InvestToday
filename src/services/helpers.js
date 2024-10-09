import moment from "moment";

export const maskPhoneNumber = (phoneNumber) => {
  if (phoneNumber.length !== 10) {
    return phoneNumber;
  }
  const maskedNumber = phoneNumber.substring(0, 4) + "xxxx" + phoneNumber.substring(8, 10);

  return maskedNumber;
};

export const formatTimestamp = (timestamp) => {
  const t = new Date(timestamp * 1000);
  const formattedTime = moment(t).format("LT");
  return formattedTime;
};

export const formatWidth = (value1, value2) => {
  const width = (value1 / (value1 + value2)) * 100;

  return (width + '%')
};

export const formatNumber = (value) => {
  const parsedValue = parseFloat(value).toFixed(2);

  const formattedValue = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(parsedValue);

  return formattedValue;
};

export const convertToLakhs = (value) => {
  const numberWithoutCommas = value?.replace(/,/g, '');
  const number = parseInt(numberWithoutCommas, 10);
  const lakhs = number / 100000;
  return lakhs.toFixed(2);
};

export const toInitCaps = (inputString) => {
  return inputString
    .split(' ') 
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) 
    .join(' '); 
};

export const convertDateFormat = (inputDate) => {
  const [month, day, year] = inputDate.split(' ');
  const formattedDay = day.replace(',', '');
  return `${formattedDay} ${month} ${year}`;
};


export const convertPriceRange = (inputString) => {
  const regex = /₹(\d+)/g;
  const matches = inputString.match(regex);

  if (matches) {
    if (matches.length === 1) {
      const price = parseFloat(matches[0].replace('₹', '')).toFixed(2);
      return price;
    } else if (matches.length === 2) {
      const firstPrice = parseFloat(matches[0].replace('₹', '')).toFixed(2);
      const secondPrice = parseFloat(matches[1].replace('₹', '')).toFixed(2);
      return `${firstPrice} - ${secondPrice}`;
    }
  }

  return '--';
};

export const extractFaceValue = (inputString) => {
  const regex = /₹(\d+)/;
  const match = inputString?.match(regex);

  if (match && match[1]) {
    return match[1];
  }

  return '--';
};

export const extractAmount = (inputString) => {
  const regex = /₹(\d+(\.\d+)?)/; 
  const match = inputString?.match(regex);
  if (match) {
    return parseFloat(match[1]); 
  }

  return '--'; 
};
