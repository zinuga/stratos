import { Store } from '@ngrx/store';
import { schema } from 'normalizr';

import { ApplicationService } from '../../features/applications/application.service';
import { SetListStateAction } from '../../store/actions/list.actions';
import { AppState } from '../../store/app-state';
import { EntityInfo } from '../../store/types/api.types';
import { PaginatedAction } from '../../store/types/pagination.types';
import { ListDataSource } from './list-data-source';

export const RouteSchema = new schema.Entity('route');

export class CfAppRoutesDataSource extends ListDataSource<EntityInfo> {
  public cfGuid: string;
  public appGuid: string;

  constructor(
    store: Store<AppState>,
    appService: ApplicationService,
    action: PaginatedAction,
    paginationKey: string
  ) {
    super({
      store,
      action,
      schema: RouteSchema,
      getRowUniqueId: (object: EntityInfo) =>
        object.entity ? object.entity.guid : null,
      paginationKey,
      entityFunctions: [
        {
          type: 'sort',
          orderKey: 'host',
          field: 'host'
        }
      ]
    });

    this.cfGuid = appService.cfGuid;
    this.appGuid = appService.appGuid;
    store.dispatch(new SetListStateAction(paginationKey, 'table'));
  }
}
