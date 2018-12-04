import { l } from "@r2c/extension/analytics";
import { CriteriaEntry } from "@r2c/extension/api/criteria";
import LastUpdatedBadge from "@r2c/extension/content/LastUpdatedBadge";
import {
  CheckmarkIcon,
  DangerIcon,
  MissingIcon,
  WarningIcon
} from "@r2c/extension/icons";
import { ExtractedRepoSlug, MarkdownString } from "@r2c/extension/utils";
import * as classnames from "classnames";
import * as React from "react";
import * as Markdown from "react-markdown";
import "./SimpleHeadsup.css";

interface SimpleHeadsupProps {
  status:
    | "safe"
    | "danger"
    | "warning"
    | "missing"
    | "unsupported"
    | "loading"
    | "error";
  icon: React.ReactChild;
  headline: string | MarkdownString;
  rightSide?: React.ReactChild;
}

export default class SimpleHeadsup extends React.PureComponent<
  SimpleHeadsupProps
> {
  public render() {
    const { status, icon, headline, rightSide } = this.props;

    return (
      <div
        className={classnames(
          "r2c-repo-headsup",
          "simple-headsup",
          `preflight-${status}`
        )}
      >
        <div className="simple-left">
          {icon}
          <Markdown source={headline} className="simple-headsup-headline" />
        </div>
        <div className="simple-right">{rightSide}</div>
      </div>
    );
  }
}

interface SimpleHeadsUpCriteriaWrapperProps {
  criteria: CriteriaEntry;
  handleClickChecksButton?: React.MouseEventHandler;
  showAllChecksButton: boolean;
  lastUpdatedDate: Date;
  repoSlug: ExtractedRepoSlug;
}

export class SimpleHeadsUpCriteriaWrapper extends React.PureComponent<
  SimpleHeadsUpCriteriaWrapperProps
> {
  public render() {
    const { override, rating } = this.props.criteria;
    const {
      handleClickChecksButton,
      showAllChecksButton,
      lastUpdatedDate,
      repoSlug
    } = this.props;

    if (override && rating === "danger") {
      const { headline } = override;

      return (
        <SimpleHeadsup
          status={rating}
          icon={<DangerIcon />}
          headline={headline}
          rightSide={this.renderRight(
            handleClickChecksButton,
            showAllChecksButton,
            lastUpdatedDate,
            repoSlug
          )}
        />
      );
    }

    return (
      <SimpleHeadsup
        status={rating}
        icon={this.renderStatus(rating)[0]}
        headline={this.renderStatus(rating)[1]}
        rightSide={this.renderRight(
          handleClickChecksButton,
          showAllChecksButton,
          lastUpdatedDate,
          repoSlug
        )}
      />
    );
  }

  private renderRight(
    handleClickChecksButton: React.MouseEventHandler | undefined,
    isExpanded: boolean | undefined,
    lastUpdatedDate: Date,
    repoSlug: ExtractedRepoSlug
  ) {
    return (
      <>
        <span className="simple-headsup-timestamp">
          <LastUpdatedBadge
            lastUpdatedDate={lastUpdatedDate}
            repoSlug={repoSlug}
          />{" "}
        </span>
        &middot;
        <span className="simple-headsup-show">
          <a
            onClick={l(
              "preflight-show-checks-button-click",
              handleClickChecksButton
            )}
            role="button"
          >
            {this.renderShow(isExpanded)}
          </a>
        </span>
      </>
    );
  }

  private renderShow(isExpanded: boolean | undefined) {
    return isExpanded ? "Hide all checks" : "Show all checks";
  }

  private renderStatus(status: string): [React.ReactChild, string] {
    switch (status) {
      case "safe":
        return [<CheckmarkIcon key={0} />, "All Preflight checks pass."];
      case "warning":
        return [<WarningIcon key={0} />, "Some Preflight checks fail."];
      default:
        return [
          <MissingIcon key={0} />,
          "There's been an error fetching criteria"
        ];
    }
  }
}

interface SimpleHeadsupDetailsWrapperProps {
  criteria: CriteriaEntry;
  handleClickChecksButton?: React.MouseEventHandler;
  showAllChecksButton: boolean;
  children: React.ReactChild;
  lastUpdatedDate: Date;
  repoSlug: ExtractedRepoSlug;
}

interface SimpleHeadsupDetailsWrapperState {
  showMore: boolean;
}

export class SimpleHeadsupDetailsWrapper extends React.PureComponent<
  SimpleHeadsupDetailsWrapperProps,
  SimpleHeadsupDetailsWrapperState
> {
  public state: SimpleHeadsupDetailsWrapperState = {
    showMore: false
  };

  public render() {
    const { criteria, children, lastUpdatedDate, repoSlug } = this.props;
    const { rating } = this.props.criteria;
    const { showMore } = this.state;

    return (
      <div
        className={classnames(
          { "detailed-headsup-open": showMore },
          `preflight-${rating}`
        )}
      >
        <SimpleHeadsUpCriteriaWrapper
          criteria={criteria}
          showAllChecksButton={showMore}
          handleClickChecksButton={this.handleShowAllChecks}
          lastUpdatedDate={lastUpdatedDate}
          repoSlug={repoSlug}
        />
        <div className={classnames({ "simple-headsup-hidden": !showMore })}>
          {children}
        </div>
      </div>
    );
  }

  private handleShowAllChecks: React.MouseEventHandler = () =>
    this.setState({ showMore: !this.state.showMore });
}
