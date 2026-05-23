import React from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "@dynatrace/strato-components-preview/layouts";

export const Header = () => {
  return (
    <AppHeader>
      <AppHeader.Navigation>
        <AppHeader.Logo as={Link} to="/" />
        <AppHeader.NavigationItem as={Link} to="/assessment">
          Assessment
        </AppHeader.NavigationItem>
        <AppHeader.NavigationItem as={Link} to="/usage">
          Usage
        </AppHeader.NavigationItem>
        <AppHeader.NavigationItem as={Link} to="/capabilities">
          Capabilities
        </AppHeader.NavigationItem>
        <AppHeader.NavigationItem as={Link} to="/learn">
          Learn
        </AppHeader.NavigationItem>
        <AppHeader.NavigationItem as={Link} to="/setup">
          IDE Setup
        </AppHeader.NavigationItem>
        <AppHeader.NavigationItem as={Link} to="/integrations">
          Integrations
        </AppHeader.NavigationItem>
        <AppHeader.NavigationItem as={Link} to="/demo">
          Demo
        </AppHeader.NavigationItem>
        <AppHeader.NavigationItem as={Link} to="/admin">
          Admin
        </AppHeader.NavigationItem>
      </AppHeader.Navigation>
    </AppHeader>
  );
};
