using System.ComponentModel.DataAnnotations;

namespace iDoctor.Api.Dtos;

public class ProfilePhotoRequest
{
    [MaxLength(1000)]
    public string? PhotoUrl { get; set; }

    public string? NormalizedUrl =>
        string.IsNullOrWhiteSpace(PhotoUrl) ? null : PhotoUrl.Trim();

    public bool IsValidUrl() =>
        NormalizedUrl is null ||
        (Uri.TryCreate(NormalizedUrl, UriKind.Absolute, out var uri) &&
         (uri.Scheme == Uri.UriSchemeHttps || uri.Scheme == Uri.UriSchemeHttp) &&
         !string.IsNullOrWhiteSpace(uri.Host) && string.IsNullOrEmpty(uri.UserInfo));
}
