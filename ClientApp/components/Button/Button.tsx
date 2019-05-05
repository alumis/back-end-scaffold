import { AlumisButton, IAlumisButtonAttributes } from "@alumis/button";
import * as cssClasses from "./_button.scss";

export class Button extends AlumisButton {

  constructor(attrs: IAlumisButtonAttributes, children: any[]) {

    super(attrs, children, cssClasses as any);
  }
}