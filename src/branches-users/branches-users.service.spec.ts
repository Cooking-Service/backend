import { Test, TestingModule } from '@nestjs/testing';
import { BranchesUsersService } from './branches-users.service';

describe('BranchesUsersService', () => {
  let service: BranchesUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BranchesUsersService],
    }).compile();

    service = module.get<BranchesUsersService>(BranchesUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
