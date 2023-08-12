import { UserEntity } from "@/entities/users.entity";
import { HttpException } from "@/exceptions/httpException";
import { compare } from "bcrypt";
import { Request, Response } from "express";

export const login = async (req:Request, res:Response) => {
  const { email, password } = req.body;
  console.log(email, password)
  if (!email || !password) throw new HttpException(409, `Please provide email and password`);
  const findUser:UserEntity = await UserEntity.findOne({ where: { email } });
  if (!findUser) return res.status(409).json({message: "User doesn't exist"});

  const isPasswordMatching: boolean = await compare(password, findUser.password);
  if (!isPasswordMatching) return res.status(409).json({message: "Password doesn't match"});
  try{
    req.session!.userId = findUser.id;
  }catch{
    console.log("failed to add session")
  }
  console.log("session Id", req.sessionID);
  res.status(200).json({message: "login success", data: {
    login: findUser
  } })

}
