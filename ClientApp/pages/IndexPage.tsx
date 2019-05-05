import { DirectoryPage, PageDirection } from "@alumis/spa";
import { Fragment, createNode } from "@alumis/observables-dom"; createNode;
import { AlertIcon } from "@alumis/icons/src/icons/AlertIcon";
import { ArchiveIcon } from "@alumis/icons/src/icons/ArchiveIcon";

export class IndexPage extends DirectoryPage {

    async loadAsync(args: { [name: string]: string; }, pageDirection: PageDirection, ev?: PopStateEvent) {

        if (!this.element) {
            (this.element = document.body).appendChild(
                <Fragment>
                    <div>Hello, world!</div>
                    <p>Lalala</p>
                    <div>Her er et ikon! <AlertIcon aria-label="heii" /> <ArchiveIcon />sadasd</div>
                </Fragment>);
        }
    }

    async replaceSubPageElementAsync(element: HTMLElement, pageDirection: PageDirection) {

    }
}