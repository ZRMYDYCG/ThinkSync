import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'

import { PrismaService } from '../prisma/prisma.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private sanitizeUser(user: {
    id: string
    email: string
    name: string | null
    avatarUrl: string | null
  }) {
    return { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl }
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })
    if (existing) {
      throw new ConflictException('Email already in use')
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10)
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name ?? null,
      },
      select: { id: true, email: true, name: true, avatarUrl: true },
    })
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    })
    return { accessToken, user: this.sanitizeUser(user) }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true, password: true, name: true, avatarUrl: true } as any,
    })
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }
    const isValid = await bcrypt.compare(dto.password, user.password)
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials')
    }
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    })
    return { accessToken, user: this.sanitizeUser(user) }
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatarUrl: true },
    })
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }
    return user
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const exists = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })
    if (!exists) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const data: { name?: string | null; avatarUrl?: string | null } = {}
    if (dto.name !== undefined) {
      data.name = dto.name
    }
    if (dto.avatarUrl !== undefined) {
      data.avatarUrl = dto.avatarUrl
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, avatarUrl: true } as any,
    })
    return user
  }
}
