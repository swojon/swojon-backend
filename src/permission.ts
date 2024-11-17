import { User } from "./interfaces/users.interface"

export const isAdmin = (user: User) => {
  return user.isAdmin 
}

export const isLoggedIn = (user: User) => {
  return user.id !== null
}

export const isModerator = (user: User) => {
  return user.isModerator || user.isAdmin || user.isStaff
}

export const isStaff = (user: User) => {
  
  return user.isStaff || user.isAdmin
}

//functions to check if the user has the permission to access the resource
export const hasObjectPermission = (user: User, instance:any) => {
    //check if the user has the permission to access the object
    if (isAdmin(user) || isModerator(user) || isStaff(user)) {
        return true
    }
    if (instance.userId === user.id) {
        return true
    }
    return false
}

export const hasActionPermission = (user: User, action: string) => {
    return isAdmin(user) || isModerator(user) || isStaff(user)
}

export const isStaffOrSelf = (requestingUser: User, onBehalfOfUserId: number) => {
  if (onBehalfOfUserId === requestingUser.id) {
    return true
  }
  if (isStaff(requestingUser)) {
    return true
  }
  return false
}

