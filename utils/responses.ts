import { Response } from "express";

interface SuccessObj {
  status?: 200 | 201;
  data?: object;
  message: string;
}

export const success = (
  res: Response,
  { data, message, status = 200 }: SuccessObj
) => {
  return res.status(status).send({
    success: true,
    data: data || {},
    message,
  });
};

interface FailureObj {
  status: number;
  message: string;
}

export const failure = (res: Response, { status, message }: FailureObj) => {
  return res.status(status).send({
    success: false,
    data: {},
    message,
  });
};
