const success = (res, data = null, message = 'Success', status = 200) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(status).json(response);
};

const error = (res, message = 'Error', status = 400) => {
  return res.status(status).json({
    success: false,
    message
  });
};

module.exports = { success, error };
