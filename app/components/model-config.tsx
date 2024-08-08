import {
  ModalConfigValidator,
  ModelConfig,
  useAppConfig,
  ModelClient,
} from "../store";

import CancelIcon from "../icons/cancel.svg";
import ConfirmIcon from "../icons/confirm.svg";
import ConnectIcon from "../icons/connection.svg";

import Locale from "../locales";
import { InputRange } from "./input-range";
import { List, ListItem, Modal, Select } from "./ui-lib";
import React, { useState } from "react";
import { IconButton } from "./button";

export function ModelConfigList() {
  const config = useAppConfig();
  const models = config.models;
  const [showApiConnectModel, setShowApiConnectModel] = useState(false);

  const [endpointInput, setEndpointInput] = useState<string>(
    config.modelConfig.mlc_endpoint,
  );

  const updateModelConfig = (updater: (config: ModelConfig) => void) => {
    const modelConfig = { ...config.modelConfig } as ModelConfig;
    updater(modelConfig);
    config.update((config) => (config.modelConfig = modelConfig));
  };

  return (
    <>
      <ListItem title={Locale.Settings.ModelClientType.Title}>
        <Select
          value={config.modelClientType}
          onChange={(e) => {
            if (e.target.value === ModelClient.WEBLLM) {
              config.update((config) => {
                config.modelClientType = e.target.value as ModelClient;
              });
            } else if (e.target.value === ModelClient.MLCLLM_API) {
              setShowApiConnectModel(true);
            }
          }}
        >
          <option value={ModelClient.WEBLLM} key={ModelClient.WEBLLM}>
            {Locale.Settings.ModelClientType.WebLlm}
          </option>
          <option value={ModelClient.MLCLLM_API} key={ModelClient.MLCLLM_API}>
            {Locale.Settings.ModelClientType.MlcLlm}
          </option>
        </Select>
      </ListItem>

      {config.modelClientType === ModelClient.WEBLLM && (
        <>
          <ListItem title={Locale.Settings.Model}>
            <Select
              value={config.modelConfig.model}
              onChange={(e) => {
                config.selectModel(e.target.value);
              }}
            >
              {models.map((v, i) => (
                <React.Fragment key={i}>
                  {i > 0 && v.family !== models[i - 1].family && <hr />}
                  <option value={v.name}>
                    {v.name}
                    {v.provider ? ` (${v.provider})` : ""}
                  </option>
                </React.Fragment>
              ))}
            </Select>
          </ListItem>
          <ListItem
            title={Locale.Settings.Temperature.Title}
            subTitle={Locale.Settings.Temperature.SubTitle}
          >
            <InputRange
              value={config.modelConfig.temperature?.toFixed(1)}
              min="0"
              max="1" // let's limit it to 0-1
              step="0.1"
              onChange={(e) => {
                updateModelConfig(
                  (config) =>
                    (config.temperature = ModalConfigValidator.temperature(
                      e.currentTarget.valueAsNumber,
                    )),
                );
              }}
            ></InputRange>
          </ListItem>
          <ListItem
            title={Locale.Settings.TopP.Title}
            subTitle={Locale.Settings.TopP.SubTitle}
          >
            <InputRange
              value={(config.modelConfig.top_p ?? 1).toFixed(1)}
              min="0"
              max="1"
              step="0.1"
              onChange={(e) => {
                updateModelConfig(
                  (config) =>
                    (config.top_p = ModalConfigValidator.top_p(
                      e.currentTarget.valueAsNumber,
                    )),
                );
              }}
            ></InputRange>
          </ListItem>
          <ListItem
            title={Locale.Settings.MaxTokens.Title}
            subTitle={Locale.Settings.MaxTokens.SubTitle}
          >
            <input
              type="number"
              min={1024}
              max={512000}
              value={config.modelConfig.max_tokens}
              onChange={(e) =>
                updateModelConfig(
                  (config) =>
                    (config.max_tokens = ModalConfigValidator.max_tokens(
                      e.currentTarget.valueAsNumber,
                    )),
                )
              }
            ></input>
          </ListItem>
          <ListItem
            title={Locale.Settings.PresencePenalty.Title}
            subTitle={Locale.Settings.PresencePenalty.SubTitle}
          >
            <InputRange
              value={config.modelConfig.presence_penalty?.toFixed(1)}
              min="-2"
              max="2"
              step="0.1"
              onChange={(e) => {
                updateModelConfig(
                  (config) =>
                    (config.presence_penalty =
                      ModalConfigValidator.presence_penalty(
                        e.currentTarget.valueAsNumber,
                      )),
                );
              }}
            ></InputRange>
          </ListItem>

          <ListItem
            title={Locale.Settings.FrequencyPenalty.Title}
            subTitle={Locale.Settings.FrequencyPenalty.SubTitle}
          >
            <InputRange
              value={config.modelConfig.frequency_penalty?.toFixed(1)}
              min="-2"
              max="2"
              step="0.1"
              onChange={(e) => {
                updateModelConfig(
                  (config) =>
                    (config.frequency_penalty =
                      ModalConfigValidator.frequency_penalty(
                        e.currentTarget.valueAsNumber,
                      )),
                );
              }}
            ></InputRange>
          </ListItem>
        </>
      )}

      {config.modelClientType === ModelClient.MLCLLM_API && (
        <>
          <ListItem
            title={Locale.Settings.MlcLlmApi.Connect.Title}
            subTitle={Locale.Settings.MlcLlmApi.Connect.SubTitle}
          >
            <IconButton
              icon={<ConnectIcon />}
              text={Locale.Settings.MlcLlmApi.Connect.Title}
              onClick={() => setShowApiConnectModel(true)}
              type="primary"
            />
          </ListItem>{" "}
          <ListItem title={Locale.Settings.Model}>
            <Select
              value={config.modelConfig.model}
              onChange={(e) => {
                config.selectModel(e.target.value);
              }}
            >
              {models.map((v, i) => (
                <React.Fragment key={i}>
                  {i > 0 && v.family !== models[i - 1].family && <hr />}
                  <option value={v.name}>
                    {v.name}
                    {v.provider ? ` (${v.provider})` : ""}
                  </option>
                </React.Fragment>
              ))}
            </Select>
          </ListItem>
        </>
      )}

      {showApiConnectModel && (
        <div className="screen-model-container">
          <Modal
            title={Locale.MlcLLMConnect.Title}
            onClose={() => setShowApiConnectModel(false)}
            actions={[
              <IconButton
                key="cancel"
                text={Locale.UI.Cancel}
                onClick={() => {
                  setShowApiConnectModel(false);
                }}
                icon={<CancelIcon />}
                bordered
                shadow
                tabIndex={0}
              ></IconButton>,
              <IconButton
                key="confirm"
                text={Locale.UI.Confirm}
                type="primary"
                onClick={() => {
                  if (!/^(http:\/\/|https:\/\/).*/i.test(endpointInput)) {
                    config.update(
                      (config) =>
                        (config.modelConfig.mlc_endpoint =
                          "http://" + endpointInput),
                    );
                  } else {
                    config.update(
                      (config) =>
                        (config.modelConfig.mlc_endpoint = endpointInput),
                    );
                  }
                  setShowApiConnectModel(false);
                  config.update((config) => {
                    config.modelClientType = ModelClient.MLCLLM_API;
                  });
                }}
                icon={<ConfirmIcon />}
                bordered
                shadow
                tabIndex={0}
              ></IconButton>,
            ]}
          >
            <List>
              <ListItem
                title={Locale.Settings.MlcLlmApi.Title}
                subTitle={Locale.Settings.MlcLlmApi.SubTitle}
              >
                <input
                  type="text"
                  value={endpointInput}
                  onChange={(e) => setEndpointInput(e.currentTarget.value)}
                ></input>
              </ListItem>
            </List>
          </Modal>
        </div>
      )}
    </>
  );
}
