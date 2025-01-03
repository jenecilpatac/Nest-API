import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { AuthUser } from '../../common/decorators/auth-user.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Patch('manage-password')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 3600000 } })
  async upateProfileSetting(
    @AuthUser() user,
    @Body() updateSettingDto: UpdateSettingDto,
  ) {
    await this.settingsService.update(user.id, updateSettingDto);

    return {
      statusCode: 200,
      message: 'Password updated successfully',
    };
  }

  @Patch('manage-personal-info')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 3600000 } })
  async upatePersonalInfoSetting(
    @AuthUser() user,
    @Body() updateSettingDto: UpdateSettingDto,
  ) {
    await this.settingsService.updatePersonalInfo(user.id, updateSettingDto);

    return {
      statusCode: 200,
      message: 'Personal information updated successfully',
    };
  }
}
