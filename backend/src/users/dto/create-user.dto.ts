import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '@/generated/prisma/enums';

export class CreateUserDto {
  @ApiProperty({ example: 'new.user@transitops.dev' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Nina Newperson' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role!: Role;
}
