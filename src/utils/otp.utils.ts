export const generateOTP = (length = 6): string => {
    return Math.floor(100000 + Math.random() * 900000).toString(); 
  };
  
  export const otpExpiresIn = (minutes = 10): Date => {
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + minutes);
    return expires;
  };
  