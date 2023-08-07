import { UserEntity } from "@/entities/users.entity";
import { HttpException } from "@/exceptions/httpException";
import { compare } from "bcrypt";
import { Request, Response } from "express";

export const login = async (req:Request, res:Response) => {
  const { email, password } = req.body;
  const findUser:UserEntity = await UserEntity.findOne({ where: { email } });
  if (!findUser) throw new HttpException(409, `Something went wrong! Please try again`);

  const isPasswordMatching: boolean = await compare(password, findUser.password);
  if (!isPasswordMatching) throw new HttpException(409, 'Something went wrong! Please try again');

  req.session!.userId = findUser.id;
  console.log("session Id", req.sessionID);
  res.status(200).json({message: "login success", data: {
    login: findUser
  } })

}
