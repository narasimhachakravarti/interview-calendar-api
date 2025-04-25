// src/modules/auth/auth.controller.ts
import { 
    Controller, 
    Post, 
    Body, 
    HttpCode, 
    HttpStatus, 
    Get, 
    UseGuards, 
    Request 
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
  import { AuthService } from './auth.service';
  import { LoginDto, RegisterDto } from './dto/auth.dto';
  import { JwtAuthGuard } from './guards/jwt-auth.guard';
  
  @ApiTags('auth')
  @Controller('auth')
  export class AuthController {
    constructor(private authService: AuthService) {}
  
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'User registered successfully' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already exists' })
    register(@Body() registerDto: RegisterDto) {
      return this.authService.register(registerDto);
    }
  
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User login' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
    login(@Body() loginDto: LoginDto) {
      return this.authService.login(loginDto);
    }
  
    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token') 
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Returns the current user profile' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    getProfile(@Request() req) {
      // req.user is added by the JwtAuthGuard
      return req.user;
    }
  }