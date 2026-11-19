import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileController } from './profile.controller';
import { Profile, ProfileSchema } from './profile.schema';
import { ProfileService } from './profile.service';
import { Achievement, AchievementSchema } from './schemas/achievement.schema';
import { ContactMessage, ContactMessageSchema } from './schemas/contact-message.schema';
import { Education, EducationSchema } from './schemas/education.schema';
import { Experience, ExperienceSchema } from './schemas/experience.schema';
import { Skill, SkillSchema } from './schemas/skill.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Profile.name, schema: ProfileSchema },
      { name: Skill.name, schema: SkillSchema },
      { name: Experience.name, schema: ExperienceSchema },
      { name: Education.name, schema: EducationSchema },
      { name: Achievement.name, schema: AchievementSchema },
      { name: ContactMessage.name, schema: ContactMessageSchema },
    ]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
