import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request-api-key')
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.authService.login(loginUserDto);
  }
}
