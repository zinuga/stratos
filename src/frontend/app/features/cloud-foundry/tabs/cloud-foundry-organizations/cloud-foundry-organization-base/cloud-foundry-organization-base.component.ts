import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { IOrgFavMetadata } from '../../../../../cf-favourite-types';
import { CurrentUserPermissions } from '../../../../../core/current-user-permissions.config';
import {
  getActionsFromExtensions,
  getTabsFromExtensions,
  StratosActionMetadata,
  StratosActionType,
  StratosTabType
} from '../../../../../core/extension/extension-service';
import { getFavoriteFromCfEntity } from '../../../../../core/user-favorite-helpers';
import { CfUserService } from '../../../../../shared/data-services/cf-user.service';
import { entityFactory, EntitySchema, organizationSchemaKey } from '../../../../../store/helpers/entity-factory';
import { IPageSideNavTab } from '../../../../dashboard/page-side-nav/page-side-nav.component';
import { UserFavorite } from '../../../../../store/types/user-favorites.types';
import { getActiveRouteCfOrgSpaceProvider } from '../../../cf.helpers';
import { CloudFoundryEndpointService } from '../../../services/cloud-foundry-endpoint.service';
import { CloudFoundryOrganizationService } from '../../../services/cloud-foundry-organization.service';
import { IBreadcrumb } from '../../../../../shared/components/breadcrumbs/breadcrumbs.types';


@Component({
  selector: 'app-cloud-foundry-organization-base',
  templateUrl: './cloud-foundry-organization-base.component.html',
  styleUrls: ['./cloud-foundry-organization-base.component.scss'],
  providers: [
    getActiveRouteCfOrgSpaceProvider,
    CfUserService,
    CloudFoundryEndpointService,
    CloudFoundryOrganizationService
  ]
})
export class CloudFoundryOrganizationBaseComponent {

  tabLinks: IPageSideNavTab[] = [
    {
      link: 'summary',
      label: 'Summary',
      matIcon: 'description'
    },
    {
      link: 'spaces',
      label: 'Spaces',
      matIcon: 'language'
    },
    {
      link: 'users',
      label: 'Users',
      matIcon: 'people'
    }
  ];

  public breadcrumbs$: Observable<IBreadcrumb[]>;

  public name$: Observable<string>;

  // Used to hide tab that is not yet implemented when in production
  public isDevEnvironment = !environment.production;

  public permsOrgEdit = CurrentUserPermissions.ORGANIZATION_EDIT;
  public permsSpaceCreate = CurrentUserPermissions.SPACE_CREATE;
  public schema: EntitySchema;

  public extensionActions: StratosActionMetadata[] = getActionsFromExtensions(StratosActionType.CloudFoundryOrg);

  public favorite$: Observable<UserFavorite<IOrgFavMetadata>>;

  constructor(
    public cfEndpointService: CloudFoundryEndpointService,
    public cfOrgService: CloudFoundryOrganizationService,
  ) {
    this.schema = entityFactory(organizationSchemaKey);
    this.favorite$ = cfOrgService.org$.pipe(
      first(),
      map(org => getFavoriteFromCfEntity(org.entity, organizationSchemaKey))
    );
    this.name$ = cfOrgService.org$.pipe(
      map(org => org.entity.entity.name),
      filter(name => !!name),
      first()
    );
    this.breadcrumbs$ = this.getBreadcrumbs();

    // Add any tabs from extensions
    this.tabLinks = this.tabLinks.concat(getTabsFromExtensions(StratosTabType.CloudFoundryOrg));
  }

  private getBreadcrumbs() {
    return this.cfEndpointService.endpoint$.pipe(
      map(endpoint => ([
        {
          breadcrumbs: [
            {
              value: endpoint.entity.name,
              routerLink: `/cloud-foundry/${endpoint.entity.guid}/organizations`
            }
          ]
        }
      ])),
      first()
    );
  }
}
