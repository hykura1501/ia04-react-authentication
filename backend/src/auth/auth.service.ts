import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { UserService } from "../user/user.service";
import { User, UserDocument } from "../user/user.schema";
import { CreateUserDto } from "./dto/create-user.dto";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService
  ) {}

  async create(
    createUserDto: CreateUserDto
  ): Promise<{ message: string; user: Partial<User> }> {
    try {
      // Check if user already exists
      const existingUser = await this.userModel.findOne({
        email: createUserDto.email,
      });
      if (existingUser) {
        throw new ConflictException("User with this email already exists");
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        saltRounds
      );

      // Create new user
      const newUser = new this.userModel({
        email: createUserDto.email,
        password: hashedPassword,
        createdAt: new Date(),
      });

      const savedUser = await newUser.save();

      // Return user without password
      const { password, ...userWithoutPassword } = savedUser.toObject();

      return {
        message: "User registered successfully",
        user: userWithoutPassword,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to create user");
    }
  }

  async setRefreshTokenHash(
    userId: string,
    refreshTokenHash: string
  ): Promise<void> {
    await this.userModel
      .updateOne({ _id: userId }, { $set: { refreshTokenHash } })
      .exec();
  }

  async clearRefreshTokenHash(userId: string): Promise<void> {
    await this.userModel
      .updateOne({ _id: userId }, { $set: { refreshTokenHash: null } })
      .exec();
  }

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const tokens = await this.issueTokens(user._id.toString(), user.email);
    const refreshHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.setRefreshTokenHash(user._id.toString(), refreshHash);
    return tokens;
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException("Refresh token is required");
    }
    const secret =
      this.configService.get<string>("JWT_REFRESH_SECRET") ||
      "dev_refresh_secret";
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, { secret });
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const user = await this.userService.findByEmail(payload.email);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException("Refresh token not found");
    }
    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    const tokens = await this.issueTokens(user._id.toString(), user.email);
    const newHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.setRefreshTokenHash(user._id.toString(), newHash);
    return tokens;
  }

  async logout(userId: string) {
    await this.clearRefreshTokenHash(userId);
    return { success: true };
  }

  private async issueTokens(sub: string, email: string) {
    const accessSecret =
      this.configService.get<string>("JWT_ACCESS_SECRET") ||
      "dev_access_secret";
    const accessExpiresRaw =
      this.configService.get<string | number>("JWT_ACCESS_EXPIRES") ?? "15m";
    const refreshSecret =
      this.configService.get<string>("JWT_REFRESH_SECRET") ||
      "dev_refresh_secret";
    const refreshExpiresRaw =
      this.configService.get<string | number>("JWT_REFRESH_EXPIRES") ?? "7d";

    const accessExpires = accessExpiresRaw as unknown as number;
    const refreshExpires = refreshExpiresRaw as unknown as number;

    const accessToken = await this.jwtService.signAsync(
      { sub, email },
      { secret: accessSecret, expiresIn: accessExpires as any }
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub, email },
      { secret: refreshSecret, expiresIn: refreshExpires as any }
    );
    return { accessToken, refreshToken };
  }
}
