import { Page } from "@dynatrace/strato-components-preview/layouts";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { Home } from "./pages/Home";
import { Assessment } from "./pages/Assessment";
import { UsageAssessment } from "./pages/UsageAssessment";
import { Capabilities } from "./pages/Capabilities";
import { LearningHub } from "./pages/LearningHub";
import { LearningCapability } from "./pages/LearningCapability";
import { SetupGuide } from "./pages/SetupGuide";
import { IntegrationExplorer } from "./pages/IntegrationExplorer";
import { IntegrationDetail } from "./pages/IntegrationDetail";
import { Demo } from "./pages/Demo";
import { DemoVertical } from "./pages/DemoVertical";

export const App = () => {
  return (
    <Page>
      <Page.Header>
        <Header />
      </Page.Header>
      <Page.Main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/usage" element={<UsageAssessment />} />
          <Route path="/capabilities" element={<Capabilities />} />
          <Route path="/learn" element={<LearningHub />} />
          <Route path="/learn/:capabilityId" element={<LearningCapability />} />
          <Route path="/setup" element={<SetupGuide />} />
          <Route path="/setup/:setupType" element={<SetupGuide />} />
          <Route path="/integrations" element={<IntegrationExplorer />} />
          <Route
            path="/integrations/:platformId"
            element={<IntegrationDetail />}
          />
          <Route path="/demo" element={<Demo />} />
          <Route path="/demo/:verticalId" element={<DemoVertical />} />
        </Routes>
      </Page.Main>
    </Page>
  );
};
