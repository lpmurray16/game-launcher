import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faGamepad, faHeart, faPlusCircle, faCog } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, FaIconComponent],
})
export class SidebarComponent {
  readonly icons = {
    gamepad: faGamepad,
    heart: faHeart,
    plus: faPlusCircle,
    cog: faCog,
  };
}
