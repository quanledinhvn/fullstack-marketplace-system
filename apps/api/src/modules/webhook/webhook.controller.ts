import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { WebhookResultDto } from './dto/webhook-result.dto';
import { WebhookService } from './webhook.service';

@Controller('internal')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('webhook')
  @Public()
  @HttpCode(200)
  handleWebhook(@Body() dto: WebhookResultDto) {
    return this.webhookService.handleResult(dto);
  }
}
