import { Component, OnInit, OnDestroy } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { forEach, get, lowerCase } from 'lodash';
import { Subscription } from 'rxjs';
import { NotesService } from '../notes/notes.service';
import { Note } from '../notes/note';
import { SidebarService } from '../partial-sidebar/sidebar.service';
import { List } from 'immutable';

interface PathNode {
  name: string;
  path: string;
  children?: PathNode[];
}

@Component({
  selector: 'partial-sidebar-folders',
  templateUrl: './partial-sidebar-folders.component.html',
  styleUrls: ['./partial-sidebar-folders.component.scss']
})
export class PartialSidebarFoldersComponent implements OnInit, OnDestroy {
  private notesServiceSubscription: Subscription;
  treeControl = new NestedTreeControl<PathNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<PathNode>();

  constructor(
    private sidebarService: SidebarService,
    private notesService: NotesService
  ) {
  }

  ngOnInit() {
    this.notesServiceSubscription = this.notesService.entries.subscribe((notes: List<Note>) => {
      this.dataSource.data = this.pathNodesFromNotes(notes.toArray());
    })

    // this.treeControl.expandAll(); // TODO: This doesn't seem to work.

  }

  ngOnDestroy() {
    if(typeof this.notesServiceSubscription !== 'undefined') {
      this.notesServiceSubscription.unsubscribe();
    }
  }

  buildPathNode(name: string, path: string): PathNode {
    return {
      'name': name,
      'path': path,
      'children': []
    };
  }

  pushTo(pathNodes: Array<PathNode>, pathNode: PathNode): PathNode {
    const pushedIndex: number = (pathNodes.push(pathNode) - 1);
    const currentPathNode = pathNodes[pushedIndex];
    return currentPathNode
  }

  getPathNodeFromPath(pathNodes: Array<PathNode>, path: string): PathNode|null {
    let foundPathNode: PathNode|null = null;

    forEach(pathNodes, (pathNode: PathNode) => {
      if(lowerCase(pathNode.name) === lowerCase(path)) {
        foundPathNode = pathNode;
        return false;
      }

      return true;
    });

    return foundPathNode;
  }

  pathNodesFromNotes(notes: Array<Note>): Array<PathNode> {
    let pathNodes: Array<PathNode> = [];

    forEach(notes, (note: Note): boolean => {
      const path: string|null = get(note, 'path', null);
      if(path === null
      || path.trim() === '') {
        return true;
      }

      const pathArray: Array<string> = path.split('/');
      let currentPathNodeChildren: Array<PathNode> = pathNodes;
      let currentPath: string = '';
      forEach(pathArray, (pathPart: string): boolean => {
        currentPath += (currentPath === '' ? '' : '/') + pathPart;
        const existingPathNode: PathNode|null = this.getPathNodeFromPath(currentPathNodeChildren, pathPart);

        if(existingPathNode === null) {
          const pushedPathNode: PathNode = this.pushTo(currentPathNodeChildren, this.buildPathNode(pathPart, currentPath));
          currentPathNodeChildren = pushedPathNode.children;
        } else {
          currentPathNodeChildren = existingPathNode.children;
        }

        return true;
      });

      return true;
    });

    return pathNodes;
  }

  hasChild = (_: number, node: PathNode) => !!node.children && node.children.length > 0;

  navigate(id: string) {
    this.sidebarService.setNavigationToId(id);
  }
}
