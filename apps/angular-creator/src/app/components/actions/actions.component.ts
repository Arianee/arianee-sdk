import { Component } from '@angular/core';
import { CreatorService } from '../../services/creator/creator.service';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
})
export class ActionsComponent {
  constructor(public creatorService: CreatorService) {}
}
