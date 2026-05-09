import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { QueueModule } from '../queue/queue.module';
import { DeployerController } from './deployer.controller';
import { DeployerService } from './deployer.service';

@Module({
  imports: [AuthModule, QueueModule],
  controllers: [DeployerController],
  providers: [DeployerService],
})
export class DeployerModule {}
