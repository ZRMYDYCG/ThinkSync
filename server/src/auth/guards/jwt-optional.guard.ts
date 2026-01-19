import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard("jwt") {
  handleRequest(err: any, user: any) {
    if (err) {
      return null;
    }
    return user ?? null;
  }
}
