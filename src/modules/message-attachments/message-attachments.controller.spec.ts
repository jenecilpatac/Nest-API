import { Test, TestingModule } from '@nestjs/testing';
import { MessageAttachmentsController } from './message-attachments.controller';
import { MessageAttachmentsService } from './message-attachments.service';

describe('MessageAttachmentsController', () => {
  let controller: MessageAttachmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageAttachmentsController],
      providers: [MessageAttachmentsService],
    }).compile();

    controller = module.get<MessageAttachmentsController>(MessageAttachmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
