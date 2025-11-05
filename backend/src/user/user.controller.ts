import { Controller, Post, Body, HttpStatus, HttpException, Get, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    const user = await this.userService.findByEmail(req.user.email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const { password, refreshTokenHash, ...rest } = user.toObject();
    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: rest,
    };
  }
}
