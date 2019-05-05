import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarService } from './sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './partial-sidebar.component.html',
  styleUrls: ['./partial-sidebar.component.scss']
})
export class PartialSidebarComponent implements OnInit {
  selected: number;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sidebarService: SidebarService
  ) {
    this.sidebarService.selected$.subscribe(num =>
      this.selected = num
    );
  }

  ngOnInit() {
  }
}
