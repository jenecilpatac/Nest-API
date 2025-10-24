import { PartialType } from '@nestjs/swagger';
import { CreateMessageAttachmentDto } from './create-message-attachment.dto';

export class UpdateMessageAttachmentDto extends PartialType(CreateMessageAttachmentDto) {}
