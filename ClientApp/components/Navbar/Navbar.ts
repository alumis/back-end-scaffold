import { Observable } from "@alumis/observables";
import { Component, IAttributes } from "@alumis/observables-dom";


export class Navbar extends Component<HTMLElement> {

    constructor() {

        super();

        (this.node = document.createElement("header")).classList.add("navbar");

    }
}

export interface IAlumisNavbarAttributes extends IAttributes {

    width: ContainerWidth | Observable<ContainerWidth> | (() => ContainerWidth);
    groups: ((Node | Component<Node>)[])[];
    sticky?: boolean;
}

export class NavbarBrand extends Component<HTMLAnchorElement> {

    constructor(attrs: IAlumisNavbarBrandAttributes, children: any[]) {
        super();
    }
}

export interface IAlumisNavbarBrandAttributes extends IAttributes {

    label: string | Observable<string> | (() => string);
    href?: string;
}

export enum ContainerWidth {

    Responsive,
    Full
}