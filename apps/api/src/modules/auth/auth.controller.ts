import { Body, Controller, Post } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { TApiResponse, TAuthResponse } from '@app/shared';
import { Public } from '../../common/decorators';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  async login(@Body() loginDto: LoginDto): Promise<TApiResponse<TAuthResponse>> {
    const result = await this.authService.validateUser(loginDto);
    return { success: true, data: plainToInstance(AuthResponseDto, result, { excludeExtraneousValues: true }) };
  }
}
