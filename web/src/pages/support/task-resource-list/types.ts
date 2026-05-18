import type { SupportTaskDto, SupportTaskTypeRef } from '../../../mocks/supportTasksMock';

export type TaskGroupBlock = {
  group: SupportTaskTypeRef;
  tasks: SupportTaskDto[];
};
