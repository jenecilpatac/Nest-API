import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePersonalDetailsDto } from './dto/update-personal-details';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}
  async addProfilePicture(createProfileDto: CreateProfileDto, userId: string) {
    await this.prisma.profile_pictures.updateMany({
      where: {
        userId: userId,
        isSet: true,
      },
      data: {
        isSet: null,
      },
    });

    return this.prisma.profile_pictures.create({
      data: {
        ...createProfileDto,
        userId: userId,
        isSet: true,
      },
    });
  }

  getProfilePictureById(userId: string, profilePictureId: number) {
    return this.prisma.profile_pictures.findUnique({
      where: {
        userId: userId,
        id: profilePictureId,
      },
    });
  }

  updateBio(updateProfileDto: UpdateProfileDto, userId: string) {
    return this.prisma.users.update({
      where: { id: userId },
      data: updateProfileDto,
    });
  }

  deleteProfilePicture(userId: string, profilePictureId: number) {
    return this.prisma.profile_pictures.delete({
      where: {
        userId: userId,
        id: profilePictureId,
      },
    });
  }

  async setProfilePicture(userId: string, profilePictureId: number) {
    await this.prisma.profile_pictures.updateMany({
      where: {
        userId: userId,
        isSet: true,
      },
      data: {
        isSet: null,
      },
    });

    return this.prisma.profile_pictures.update({
      where: {
        userId: userId,
        id: profilePictureId,
      },
      data: {
        isSet: true,
      },
    });
  }

  updatePersonalDetails(
    updatePersonalDetailsDto: UpdatePersonalDetailsDto,
    userId: string,
  ): Promise<any> {
    return this.prisma.users.update({
      where: { id: userId },
      data: {
        ...updatePersonalDetailsDto,
      },
    });
  }
}
