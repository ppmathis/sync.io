$(function() {
    var UPDATE_INTERVAL = 5000;

    function ViewModel() {
        var self = this;
        self.appVersion = ko.observable();
        self.wasDeleted = ko.observable();
        self.currentShare = ko.observable({});
        self.shares = ko.observableArray([]);

        // Show peer list modal
        self.showPeers = function(share) {
            self.wasDeleted(false);
            self.currentShare(share);

            modal = $('<div></div>')
            modal.append($('<div data-bind="visible: wasDeleted" class="alert alert-warning"><b>Oh snap!</b> It seems like no peers were active, which is why this share announcement was deleted.</div>'));
            peerlist = $('<table id="peer-table" class="share-table peer-table"></table>');
            peerlist.append($('<thead><tr><th>Peer ID</th><th>Remote address</th><th>Local address</th><th>Last ping</th></tr></thead>'));
            peerlist.append($('<tbody data-bind="foreach: currentShare().peers"><tr><td data-bind="text: id"></td><td data-bind="text: rpeer.address + \':\' + rpeer.port"></td><td data-bind="text: lpeer.address + \':\' + lpeer.port"></td><td data-bind="text: moment(updatedAt).format(\'HH:mm:ss\')"></td></tr></tbody>'))
            modal.append(peerlist);

            BootstrapDialog.show({
                title: 'Peer list of ' + share.id,
                message: modal
            });
            ko.applyBindings(self, $(modal)[0]);
        };

        // Flushes an share announcement
        self.flushAnnouncement = function(share) {
            $.getJSON('/api/flush/' + share.id, function(data) {
                updateShares();
            }).fail(function() {
                alert('Could not flush share: ' + share.id);
            });
        };

        // Get application version from server
        $.getJSON('/api/version', function(data) {
            self.appVersion(data.version || 'N/A');
        });

        // Regularly update share data
        function updateShares() {
            $.getJSON('/api/shares', function(data) {
                self.shares(data.shares || []);

                var foundActivePeerList = false;
                for(var key in data.shares) {
                    if(!data.shares.hasOwnProperty(key)) continue;

                    if(data.shares[key].id == self.currentShare().id) {
                        self.currentShare(data.shares[key]);
                        foundActivePeerList = true;
                        break;
                    }
                }

                self.wasDeleted(!foundActivePeerList);
            });
            setTimeout(updateShares, UPDATE_INTERVAL);
        }
        updateShares();
    }

    window.viewModel = viewModel = new ViewModel();
    ko.applyBindings(viewModel);
});